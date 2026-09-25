import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ unique: true })
  doc_code: string;

  @Column() // Jalali date as string, e.g., '1400/01/28'
  issue_date: string;

  @Column()
  file_url: string;
}