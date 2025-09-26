const AuditLog = require('../models/AuditLog');

// Middleware to automatically log actions
const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          const success = res.statusCode >= 200 && res.statusCode < 400;
          
          await AuditLog.logAction({
            action,
            entityType,
            entityId: req.params.id || req.body.pharmacyId || req.body.orderId || req.user?.id,
            userId: req.user?.id,
            pharmacyId: req.user?.pharmacyId || req.body.pharmacyId,
            details: {
              method: req.method,
              url: req.originalUrl,
              body: sanitizeBody(req.body),
              params: req.params,
              query: req.query
            },
            metadata: {
              ipAddress: req.ip || req.connection.remoteAddress,
              userAgent: req.get('User-Agent'),
              timestamp: new Date()
            },
            success,
            errorMessage: success ? null : getErrorMessage(data),
            severity: getSeverity(action, success)
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Sanitize sensitive data from request body
function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.confirmPassword;
  delete sanitized.token;
  delete sanitized.apiKey;
  
  return sanitized;
}

// Extract error message from response
function getErrorMessage(data) {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed.message || parsed.error || 'Unknown error';
  } catch {
    return 'Parse error';
  }
}

// Determine severity based on action and success
function getSeverity(action, success) {
  if (!success) return 'high';
  
  const criticalActions = ['pharmacy_verification', 'order_assigned'];
  const highActions = ['pharmacy_signup', 'order_created'];
  const mediumActions = ['order_status_changed', 'stock_updated'];
  
  if (criticalActions.includes(action)) return 'critical';
  if (highActions.includes(action)) return 'high';
  if (mediumActions.includes(action)) return 'medium';
  
  return 'low';
}

// Manual logging function for complex operations
const logManualAction = async (actionData) => {
  try {
    await AuditLog.logAction(actionData);
  } catch (error) {
    console.error('Manual audit logging failed:', error);
  }
};

// Log distance calculations
const logDistanceCalculation = async (userLocation, pharmacies, results) => {
  try {
    await AuditLog.logAction({
      action: 'distance_calculated',
      entityType: 'system',
      entityId: new Date().getTime(), // Use timestamp as ID for system actions
      details: {
        userLocation,
        pharmacyCount: pharmacies.length,
        resultsCount: results.length,
        nearestDistance: results[0]?.distance,
        calculationMethod: process.env.GOOGLE_MAPS_API_KEY ? 'google_maps' : 'haversine'
      },
      metadata: {
        timestamp: new Date()
      },
      severity: 'low'
    });
  } catch (error) {
    console.error('Distance calculation audit failed:', error);
  }
};

// Log pharmacy availability changes
const logAvailabilityChange = async (pharmacyId, changes, userId) => {
  try {
    await AuditLog.logAction({
      action: 'pharmacy_availability_changed',
      entityType: 'pharmacy',
      entityId: pharmacyId,
      userId,
      pharmacyId,
      changes,
      details: {
        changedFields: Object.keys(changes.after || {})
      },
      metadata: {
        timestamp: new Date()
      },
      severity: 'medium'
    });
  } catch (error) {
    console.error('Availability change audit failed:', error);
  }
};

module.exports = {
  auditLogger,
  logManualAction,
  logDistanceCalculation,
  logAvailabilityChange
};