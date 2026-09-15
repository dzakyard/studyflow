export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DepthLevel = "brief" | "standard" | "deep_dive";

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          subject_area: string;
          description: string | null;
          syllabus_topics: string[];
          textbook_reference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          subject_area: string;
          description?: string | null;
          syllabus_topics?: string[];
          textbook_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          subject_area?: string;
          description?: string | null;
          syllabus_topics?: string[];
          textbook_reference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      lectures: {
        Row: {
          id: string;
          course_id: string;
          user_id: string;
          title: string | null;
          lecture_date: string;
          minimal_notes: string | null;
          expanded_notes: string | null;
          summary: string | null;
          depth_level: DepthLevel;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          user_id?: string;
          title?: string | null;
          lecture_date?: string;
          minimal_notes?: string | null;
          expanded_notes?: string | null;
          summary?: string | null;
          depth_level?: DepthLevel;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          user_id?: string;
          title?: string | null;
          lecture_date?: string;
          minimal_notes?: string | null;
          expanded_notes?: string | null;
          summary?: string | null;
          depth_level?: DepthLevel;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lectures_course_id_fkey";
            columns: ["course_id"];
            isOneToOne: false;
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lectures_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      depth_level: DepthLevel;
    };
  };
}

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type InsertCourse = Database["public"]["Tables"]["courses"]["Insert"];
export type UpdateCourse = Database["public"]["Tables"]["courses"]["Update"];

export type Lecture = Database["public"]["Tables"]["lectures"]["Row"];
export type InsertLecture = Database["public"]["Tables"]["lectures"]["Insert"];
export type UpdateLecture = Database["public"]["Tables"]["lectures"]["Update"];

export interface SharedLecture {
  id: string;
  lecture_id: string;
  shared_by: string;
  shared_with: string | null;
  access_level: "view" | "edit";
  invite_token: string;
  created_at: string;
}

export interface NoteVersion {
  id: string;
  lecture_id: string;
  expanded_notes: string | null;
  summary: string | null;
  created_at: string;
}
