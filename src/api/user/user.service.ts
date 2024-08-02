import { inject, injectable } from "tsyringe";
import { Repository } from "typeorm";
import { InjectRepository } from "../../decorators/inject-repository.decorator";
import {
  BadRequestException,
  NotFoundException,
} from "../../helpers/error-type";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./user.entity";
import { Book } from "../book/book.entity";
import { ReturnBookDto } from "./dto/return-book.dto";
import { TypeORMService } from "../../database/typeorm.service";
import { Score } from "../score/score.entity";
import { CacheService } from "../../cache/cache.service";

@injectable()
export class UserService {
  constructor(
    @inject(TypeORMService) private typeORMService: TypeORMService,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
    @InjectRepository(Score) private scoreRepository: Repository<Score>,
    @inject(CacheService) private cacheService: CacheService
  ) { }

  async returnBook({ userId, bookId, dto }: { userId: string; bookId: string; dto: ReturnBookDto }) {
    const [user, book] = await Promise.all([
      this.userRepository.findOneBy({
        id: parseInt(userId)
      }),
      this.bookRepository.findOneBy({
        id: parseInt(bookId)
      }),
    ]);

    if (!user || !book || book.borrower_id !== user.id) {
      throw new BadRequestException();
    }

    this.cacheService.clear("cache:getUsers:[]", `cache:getUser:[${user.id}]`, "cache:getBooks:[]", `cache:getBook:[${book.id}]`);

    const existingScore = await this.scoreRepository.findOneBy({
      user_id: user.id,
      book_id: book.id
    });

    if (existingScore) {
      console.log("Something went wrong, a user was able to borrow a book that they already scored before");
      book.borrower = null;
      await this.bookRepository.save(book);

      throw new BadRequestException();
    }

    const result = await this.typeORMService.dataSource.transaction(async (entityManager) => {
      book.borrower = null;

      const score = new Score();
      score.book_id = book.id;
      score.user_id = user.id;
      score.rating = dto.score;

      await Promise.all([
        entityManager.save(Book, book),
        entityManager.save(Score, score)
      ]);

      return score;
    });

    return result;
  }

  async borrowBook({ userId, bookId }: { userId: string; bookId: string; }) {
    const [user, book, score] = await Promise.all([
      this.userRepository.findOneBy({
        id: parseInt(userId)
      }),
      this.bookRepository.findOneBy({
        id: parseInt(bookId)
      }),
      this.scoreRepository.findOneBy({
        user_id: parseInt(userId),
        book_id: parseInt(bookId)
      })
    ]);

    if (!user || !book || !!book.borrower_id || score) {
      throw new BadRequestException();
    }

    this.cacheService.clear("cache:getUsers:[]", `cache:getUser:[${user.id}]`, "cache:getBooks:[]", `cache:getBook:[${book.id}]`);

    book.borrower = user;
    await this.bookRepository.save(book);

    return book;
  }

  async getUsers() {
    const query = this.userRepository.createQueryBuilder();

    query.select("id");
    query.addSelect("name");

    return query.getRawMany();
  }

  async getUser(userId: string) {
    const query = this.userRepository.createQueryBuilder("u");

    query.select("u.id");
    query.addSelect("u.name");
    query.leftJoinAndSelect("u.books", "books");
    query.leftJoinAndSelect("u.scores", "scores");
    query.leftJoinAndSelect("scores.book", "book");

    query.where("u.id = :userId", { userId })

    const result = await query.getOne();

    if (!result) {
      throw new NotFoundException();
    }

    return {
      id: result.id,
      name: result.name,
      books: {
        past: result.scores.map(score => ({ name: score.book.name, userScore: score.rating })),
        present: result.books.map(book => ({ name: book.name }))
      }
    }
  }

  async create(dto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      name: dto.name,
    });

    if (existingUser) {
      throw new BadRequestException();
    }

    const savedUser = await this.userRepository.save({
      name: dto.name,
    });

    this.cacheService.clear("cache:getUsers:[]", `cache:getUser:[${savedUser.id}]`);

    return { name: savedUser.name, id: savedUser.id };
  }
}
