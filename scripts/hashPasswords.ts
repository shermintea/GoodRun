/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      scripts/hashPasswords.ts
*Author:    IT Project – Medical Pantry – Group 17
*Date:      08-10-2025
*Version:   1.0
*Purpose:   Simple script which allows bcrypt password hashing.
*           Ran to produce password_hash fields for test user records.
*Revisions:
*v1.0 - 08-10-2025 - Initial implementation
*******************************************************/

import bcrypt from "bcryptjs";

const password = "000"; // choose any test password
const hash = await bcrypt.hash(password, 10);
console.log("Hashed password:", hash);