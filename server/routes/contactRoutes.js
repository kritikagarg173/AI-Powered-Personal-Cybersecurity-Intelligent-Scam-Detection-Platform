const express = require("express");
const mongoose = require("mongoose");
const TrustedContact = require("../models/TrustedContact");
const User = require("../models/User");

const router = express.Router();

// ======================================================
// DEMO USER HELPER
// ======================================================

const getDemoUserId = async () => {
  const demoUser = await User.findOne()
    .select("_id")
    .lean();

  return demoUser?._id || null;
};

// ======================================================
// ADD TRUSTED CONTACT
// POST /api/contacts
// ======================================================

router.post("/", async (req, res) => {
  try {
    const user = await getDemoUserId();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No demo user found",
      });
    }

    const {
      name,
      phone,
      relationship = "Trusted Contact",
      priority = 1,
      isPrimary = false,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact name is required",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (isPrimary) {
      await TrustedContact.updateMany(
        { user },
        { $set: { isPrimary: false } }
      );
    }

    const contact = await TrustedContact.create({
      user,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      priority,
      isPrimary,
    });

    return res.status(201).json({
      success: true,
      message: "Trusted contact added successfully",
      contact,
    });
  } catch (error) {
    console.error("Add trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL TRUSTED CONTACTS
// GET /api/contacts
// ======================================================

router.get("/", async (req, res) => {
  try {
    const user = await getDemoUserId();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No demo user found",
      });
    }

    const contacts = await TrustedContact.find({
      user,
    }).sort({
      isPrimary: -1,
      priority: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Get trusted contacts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trusted contacts",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE TRUSTED CONTACT
// GET /api/contacts/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const user = await getDemoUserId();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No demo user found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Get trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE TRUSTED CONTACT
// PUT /api/contacts/:id
// ======================================================

router.put("/:id", async (req, res) => {
  try {
    const user = await getDemoUserId();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No demo user found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    const {
      name,
      phone,
      relationship,
      priority,
      isPrimary,
    } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Contact name cannot be empty",
        });
      }

      contact.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty",
        });
      }

      contact.phone = phone.trim();
    }

    if (relationship !== undefined) {
      contact.relationship = relationship;
    }

    if (priority !== undefined) {
      contact.priority = priority;
    }

    if (isPrimary !== undefined) {
      if (isPrimary === true) {
        await TrustedContact.updateMany(
          {
            user,
            _id: { $ne: contact._id },
          },
          {
            $set: {
              isPrimary: false,
            },
          }
        );
      }

      contact.isPrimary = isPrimary;
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Trusted contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Update trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// MAKE CONTACT PRIMARY
// PATCH /api/contacts/:id/primary
// ======================================================

router.patch("/:id/primary", async (req, res) => {
  try {
    const user = await getDemoUserId();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No demo user found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOne({
      _id: req.params.id,
      user,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    await TrustedContact.updateMany(
      { user },
      { $set: { isPrimary: false } }
    );

    contact.isPrimary = true;
    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Primary trusted contact updated successfully",
      contact,
    });
  } catch (error) {
    console.error("Set primary contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update primary trusted contact",
      error: error.message,
    });
  }
});

// ======================================================
// DELETE TRUSTED CONTACT
// DELETE /api/contacts/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const user = await getDemoUserId();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No demo user found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    const contact = await TrustedContact.findOneAndDelete({
      _id: req.params.id,
      user,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Trusted contact not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trusted contact deleted successfully",
      deletedContact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
      },
    });
  } catch (error) {
    console.error("Delete trusted contact error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete trusted contact",
      error: error.message,
    });
  }
});

module.exports = router;