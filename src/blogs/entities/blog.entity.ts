import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({ name: 'blogs' }) // setting up different name for table name
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'number' })
  user_id: number;

  @Column({ type: 'varchar', length: 120, unique: true })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.blogs) // Define the relationship: many blogs to one user
  @JoinColumn({ name: 'user_id' }) // Specify the column name that will store the user's ID in the blog table
  user: User;

  constructor(blog: Partial<Blog>) {
    Object.assign(this, blog);
  }
}
