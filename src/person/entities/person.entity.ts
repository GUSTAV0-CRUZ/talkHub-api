import { IsEmail } from 'class-validator';
import { Message } from 'src/messages/entities/Message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ length: 250 })
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: '' })
  pictureName: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @OneToMany(() => Message, message => message.to)
  messageSent: Message[];

  @OneToMany(() => Message, message => message.from)
  messageReceived: Message[];
}
