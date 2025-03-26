import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity({ name: 'users' }) // setting up different name for table name
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', length: 24 })
  username: string;

  @Column({ type: 'varchar', length: 24 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;
}
