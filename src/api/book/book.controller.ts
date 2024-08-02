import { inject } from "tsyringe";
import { Controller } from "../../decorators/controller.decorator";
import { BookService } from "./book.service";
import { Post } from "../../decorators/post.decorator";
import { Get } from "../../decorators/get.decorator";
import { Param } from "../../decorators/param.decorator";
import { Body } from "../../decorators/body.decorator";
import { CreateBookDto } from "./dto/create-book.dto";

@Controller("books")
export class BookController {
  constructor(@inject(BookService) private bookService: BookService) { }

  @Get()
  async getBooks() {
    return this.bookService.getBooks();
  }

  @Get(":id")
  async getBook(@Param("id") bookId: string) {
    return this.bookService.getBook(bookId);
  }

  @Post()
  async create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }
}