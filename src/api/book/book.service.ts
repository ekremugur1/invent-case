import { injectable } from "tsyringe";
import { Repository } from "typeorm";
import { InjectRepository } from "../../decorators/inject-repository.decorator";
import { Book } from "./book.entity";
import { BadRequestException, NotFoundException } from "../../helpers/error-type";
import { CreateBookDto } from "./dto/create-book.dto";

@injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) private bookRepository: Repository<Book>
  ) { }

  async create(dto: CreateBookDto) {
    const existingUser = await this.bookRepository.findOneBy({
      name: dto.name,
    });

    if (existingUser) {
      throw new BadRequestException();
    }

    const savedBook = await this.bookRepository.save({
      name: dto.name,
    });

    return { name: savedBook.name, id: savedBook.id };
  }

  async getBooks() {
    const query = this.bookRepository.createQueryBuilder();

    query.select("id");
    query.addSelect("name");

    return query.getRawMany();
  }

  async getBook(bookId: string) {
    try {
      const query = this.bookRepository.createQueryBuilder("b");

      query.leftJoinAndSelect("b.scores", "score");

      query.select("b.id");
      query.addSelect("b.name");
      query.addSelect("ROUND(COALESCE(AVG(score.rating), -1)::numeric, 2)", "average")

      query.where("b.id = :bookId", { bookId });
      query.groupBy("b.id")

      const result = await query.getRawOne();

      if (!result) {
        throw new NotFoundException();
      }

      return {
        id: result.b_id,
        name: result.b_name,
        score: result.average
      };
    } catch (error) {
      console.log(error);

    }
  }
}