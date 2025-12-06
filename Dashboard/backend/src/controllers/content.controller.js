const Content = require('../models/Content.model');

exports.getAllContent = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', type = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) query.type = type;
    if (status) query.status = status;

    const contents = await Content.find(query)
      .populate('author', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Content.countDocuments(query);

    res.json({
      contents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getContentById = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id).populate('author', 'name email');
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    res.json({ content });
  } catch (error) {
    next(error);
  }
};

exports.createContent = async (req, res, next) => {
  try {
    const content = await Content.create({
      ...req.body,
      author: req.user._id
    });

    await content.populate('author', 'name email');
    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    next(error);
  }
};

exports.updateContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check permissions (author or admin/superadmin)
    if (content.author.toString() !== req.user._id.toString() && 
        !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }

    Object.assign(content, req.body);
    await content.save();
    await content.populate('author', 'name email');

    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    next(error);
  }
};

exports.deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check permissions
    if (content.author.toString() !== req.user._id.toString() && 
        !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }

    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    next(error);
  }
};

