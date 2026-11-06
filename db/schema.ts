import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const flights = sqliteTable("flights", {
 token: text("token").primaryKey(), student: text("student").notNull(),
 fullName: text("full_name").notNull(), team: text("team").notNull(), nick: text("nick").notNull(),
 started: integer("started").notNull(), ended: integer("ended"), seconds: integer("seconds").notNull().default(0),
 deck: text("deck").notNull(), answers: text("answers").notNull().default("[]"),
 score: integer("score").notNull().default(0), maximum: integer("maximum").notNull().default(120),
 correct: integer("correct").notNull().default(0), wrong: integer("wrong").notNull().default(0),
 stages: integer("stages").notNull().default(0), medal: text("medal"), status: text("status").notNull().default("playing")
}, t => [index("flights_student").on(t.student)]);