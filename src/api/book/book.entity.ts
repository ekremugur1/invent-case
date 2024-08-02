import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../user/user.entity";
import { Score } from "../score/score.entity";

@Entity({
  name: "books"
})
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  borrower_id: number | null;

  @ManyToOne(() => User, user => user.books, { nullable: true })
  @JoinColumn({ name: "borrower_id" })
  borrower: User | null;

  @OneToMany(() => Score, score => score.book)
  scores: Score[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}