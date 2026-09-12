const { getDb } = require('../database/db');

// GET /api/notifications
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    const notifications = await db.all(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );

    const unreadCountRow = await db.get(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    res.json({
      success: true,
      unreadCount: unreadCountRow ? unreadCountRow.count : 0,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/notifications/:id/read
async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = await getDb();
    await db.run(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/notifications/read-all
async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    await db.run(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/notifications/:id
async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = await getDb();
    await db.run(
      `DELETE FROM notifications WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification deleted.'
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/notifications
async function clearAllNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const db = await getDb();

    await db.run(
      `DELETE FROM notifications WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications cleared.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
