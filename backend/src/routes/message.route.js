import express from 'express'
import { getAllContacts } from '../controller/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js'
import { getMessageByUserId } from '../controller/message.controller.js';
import { sendMessage } from '../controller/message.controller.js';
import { getChatPartners } from '../controller/message.controller.js';
import { arcjetProtection } from '../middleware/arcjet.middleware.js';
import { upload } from '../middleware/upload.js';
const router = express.Router();
router.use(arcjetProtection ,protectRoute)

router.get("/contacts",getAllContacts);

router.get("/chats",getChatPartners);

router.get("/:id",getMessageByUserId);

router.post(
    "/send/:id",
    protectRoute,
    upload.single("image"),
    sendMessage
);

export default router;