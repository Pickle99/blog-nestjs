import { Blog } from 'src/blogs/entities/blog.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity({ name: 'users' }) // Setting up different name for table name
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 24 })
  username: string;

  @Column({ type: 'varchar', length: 24 })
  fullname: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @OneToMany(() => Blog, (blog) => blog.user) // Define the relationship: one user to many blogs
  blogs: Blog[];

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }
}
