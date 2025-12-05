import { pgTable, varchar, timestamp, foreignKey, serial, text, integer, boolean, unique, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	name: varchar(),
	email: varchar().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: varchar(),
});

export const accounts = pgTable("accounts", {
	id: serial().primaryKey().notNull(),
	userId: varchar().notNull(),
	type: varchar().notNull(),
	provider: varchar().notNull(),
	providerAccountId: varchar().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	tokenType: varchar("token_type"),
	scope: varchar(),
	idToken: text("id_token"),
	sessionState: varchar("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "accounts_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const careerDocuments = pgTable("career_documents", {
	id: serial().primaryKey().notNull(),
	userId: varchar().notNull(),
	title: varchar().notNull(),
	description: text(),
	documentUrl: varchar().notNull(),
	documentType: varchar().notNull(),
	fileName: varchar().notNull(),
	careerCategoryId: integer().notNull(),
	isPublic: boolean().default(false),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "career_documents_userId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.careerCategoryId],
			foreignColumns: [careerCategories.id],
			name: "career_documents_careerCategoryId_career_categories_id_fk"
		}).onDelete("cascade"),
]);

export const careerCategories = pgTable("career_categories", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	description: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("career_categories_name_unique").on(table.name),
]);

export const sessions = pgTable("sessions", {
	id: varchar().primaryKey().notNull(),
	sessionToken: varchar().notNull(),
	userId: varchar().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "sessions_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("sessions_sessionToken_unique").on(table.sessionToken),
]);

export const tattooPosts = pgTable("tattoo_posts", {
	id: serial().primaryKey().notNull(),
	userId: varchar().notNull(),
	title: varchar().notNull(),
	caption: text().notNull(),
	imageUrl: varchar().notNull(),
	fileName: varchar().notNull(),
	isPosted: boolean().default(false),
	instagramPosted: boolean().default(false),
	facebookPosted: boolean().default(false),
	whatsappPosted: boolean().default(false),
	xPosted: boolean().default(false),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	postedAt: timestamp({ mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tattoo_posts_userId_users_id_fk"
		}).onDelete("cascade"),
]);

export const websiteLinks = pgTable("website_links", {
	id: serial().primaryKey().notNull(),
	userId: varchar().notNull(),
	title: varchar().notNull(),
	url: varchar().notNull(),
	description: text(),
	thumbnailUrl: varchar(),
	customText: varchar(),
	careerCategoryId: integer().notNull(),
	isPublic: boolean().default(false),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "website_links_userId_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.careerCategoryId],
			foreignColumns: [careerCategories.id],
			name: "website_links_careerCategoryId_career_categories_id_fk"
		}).onDelete("cascade"),
]);

export const userCredentials = pgTable("user_credentials", {
	id: serial().primaryKey().notNull(),
	userId: varchar().notNull(),
	password: varchar().notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_credentials_userId_users_id_fk"
		}).onDelete("cascade"),
	unique("user_credentials_userId_unique").on(table.userId),
]);

export const verificationTokens = pgTable("verificationTokens", {
	identifier: varchar().notNull(),
	token: varchar().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationTokens_identifier_token_pk"}),
]);
