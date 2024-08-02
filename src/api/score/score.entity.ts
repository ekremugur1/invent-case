import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Book } from "../book/book.entity";

@Entity({
  name: "scores"
})
@Unique(["user", "book"])
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column()
  user_id: number;

  @Column()
  book_id: number;

  @ManyToOne(() => User, user => user.scores)
  @JoinColumn({ name: "user_id" })
  user: User;

  @ManyToOne(() => Book, book => book.scores)
  @JoinColumn({ name: "book_id" })
  book: Book;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}