
import catchAsync from '../../utils/catchAsync';
import Order from '../../models/order';

export const getAllOrders = catchAsync(async (req, res, next) => {
  // Get query parameters for pagination, filtering, and sorting
  const { page = 1, limit = 10, sortBy, ...filters } = req.query;

  // Validate and sanitize the sortBy parameter
  const sanitizedSortBy = Object.keys(Order.schema.paths).filter(field => field !== '__v');

  // Get the list of fields allowed in the model for filtering
  const allowedFilterFields = Object.keys(Order.schema.paths).filter(field => field !== '__v');

  // Filter the incoming filters to only include valid fields
  const validFilters = {};
  for (const field in filters) {
    if (allowedFilterFields.includes(field)) {
      validFilters[field] = filters[field];
    }
  }

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Fetch orders with applied valid filters, sanitized sorting, and pagination
  const query = Order.find(validFilters).sort(sanitizedSortBy).skip(skip).limit(parseInt(limit));

  const orders = await query;
  
  // Get total count of orders without pagination
  const totalCount = await Order.countDocuments(validFilters);

  res.status(200).json({
    status: 'success',
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalCount,
    },
  });
});

// Update order status
export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const { newStatus } = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// Add more controller functions for other order-related routes
