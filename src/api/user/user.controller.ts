import { inject } from "tsyringe";
import { Body } from "../../decorators/body.decorator";
import { Controller } from "../../decorators/controller.decorator";
import { Get } from "../../decorators/get.decorator";
import { Post } from "../../decorators/post.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserService } from "./user.service";
import { Param } from "../../decorators/param.decorator";
import { ReturnBookDto } from "./dto/return-book.dto";

@Controller("users")
export class UserController {
  constructor(@inject(UserService) private userService: UserService) { }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }

  @Get(":id")
  async getUser(@Param("id") userId: string) {
    return this.userService.getUser(userId);
  }

  @Post(":userId/borrow/:bookId")
  async borrowBook(@Param("userId") userId: string, @Param("bookId") bookId: string) {
    return this.userService.borrowBook({ userId, bookId });
  }

  @Post(":userId/return/:bookId")
  async returnBook(@Param("userId") userId: string, @Param("bookId") bookId: string, @Body() dto: ReturnBookDto) {
    return this.userService.returnBook({ userId, bookId, dto });
  }
}
