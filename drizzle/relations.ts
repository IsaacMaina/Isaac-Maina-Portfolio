import { relations } from "drizzle-orm/relations";
import { 
  users, 
  userProfiles, 
  projects, 
  documents, 
  galleryItems, 
  skillCategories, 
  skills, 
  education, 
  experience, 
  certifications, 
  additionalSkills,
  accounts,
  sessions,
  verificationTokens
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userProfiles: many(userProfiles),
  education: many(education),
  experience: many(experience),
  certifications: many(certifications),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id]
  })
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id]
  })
}));

export const galleryItemsRelations = relations(galleryItems, ({ one }) => ({
  user: one(users, {
    fields: [galleryItems.userId],
    references: [users.id]
  })
}));

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  skills: many(skills),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  skillCategory: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id]
  })
}));

export const educationRelations = relations(education, ({ one }) => ({
  user: one(users, {
    fields: [education.userId],
    references: [users.id]
  })
}));

export const experienceRelations = relations(experience, ({ one }) => ({
  user: one(users, {
    fields: [experience.userId],
    references: [users.id]
  })
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  user: one(users, {
    fields: [certifications.userId],
    references: [users.id]
  })
}));

export const additionalSkillsRelations = relations(additionalSkills, ({ one }) => ({
  user: one(users, {
    fields: [additionalSkills.userId],
    references: [users.id]
  })
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id]
  })
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id]
  })
}));