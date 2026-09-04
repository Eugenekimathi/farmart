# Farmart User Journey Testing Guide

This guide documents the complete user journey for testing the Farmart application from a clean database setup.

## Prerequisites

1. Clean database setup (run `python clean_setup.py` in Backend)
2. Backend server running (`python run.py`)
3. Frontend server running (`npm run dev` in Frontend)

## Complete User Journey Test

### Phase 1: Farmer Registration & Setup

#### Step 1: Register as a Farmer
1. Navigate to the frontend application
2. Click "Register" in the navbar
3. Fill in registration form:
   - Full Name: "Test Farmer"
   - Email: "farmer@test.com"
   - Phone: "0712345678"
   - Password: "Test@1234"
   - Role: Select "Farmer"
   - Location: "Nairobi"
4. Submit registration
5. **Expected**: User is registered and automatically logged in as a farmer

#### Step 2: Create Farmer Profile
1. Navigate to Farmer Portal
2. Fill in farmer profile details:
   - Farm Name: "Test Farm"
   - Farm Location: "Nairobi, Kenya"
   - Description: "Test farm for demonstration"
3. Submit profile
4. **Expected**: Farmer profile created successfully

#### Step 3: Add Animal Listing
1. In Farmer Portal, click "Add New Animal"
2. Fill in animal details:
   - Name: "Test Cow"
   - Animal Type: Select "Cattle"
   - Breed: Select "Boran"
   - Gender: "Female"
   - Age: 24 (months)
   - Price: 75000
   - Location: "Nairobi"
   - Description: "Healthy Boran cow for sale"
   - Upload animal image (required)
3. Submit animal
4. **Expected**: Animal listed successfully and visible in farmer's listings

### Phase 2: Buyer Registration & Discovery

#### Step 4: Register as a Buyer
1. Logout from farmer account
2. Click "Register" in navbar
3. Fill in registration form:
   - Full Name: "Test Buyer"
   - Email: "buyer@test.com"
   - Phone: "0723456789"
   - Password: "Test@1234"
   - Role: Select "Buyer"
   - Location: "Nairobi"
4. Submit registration
5. **Expected**: User is registered and automatically logged in as a buyer

#### Step 5: Browse Animals
1. Navigate to Store page
2. **Expected**: See the animal listed by the farmer
3. **Verify**: Animal details match what was listed (name, price, breed, etc.)

#### Step 6: View Animal Details
1. Click on the animal card
2. **Expected**: Animal detail page shows:
   - Animal images
   - Full description
   - Price
   - Farmer information
   - Trust badges
   - "Buy Direct" and "Add to Cart" buttons

### Phase 3: Purchase Flow

#### Step 7: Add to Cart
1. On animal detail page, click "Add to Cart"
2. **Expected**: Button changes to "Added to Cart" and is disabled
3. Navigate to Cart page
4. **Expected**: Animal appears in cart with correct price

#### Step 8: Proceed to Checkout
1. In Cart page, click "Proceed to Checkout"
2. **Expected**: Navigate to Checkout page
3. Fill in checkout details:
   - Delivery Address: "123 Test Street, Nairobi"
   - Delivery Phone: "0723456789"
4. **Expected**: Order summary shows correct total

#### Step 9: Complete Payment
1. **Option A - With M-Pesa Credentials**:
   - Click "Pay Now"
   - Enter M-Pesa phone number
   - **Expected**: STK Push initiated to phone
   - Complete payment on phone
   - **Expected**: Payment recorded and order confirmed

2. **Option B - Without M-Pesa Credentials**:
   - Payment will be marked as manual recording
   - Admin can manually record payment in backend
   - **Expected**: Order created with pending payment status

#### Step 10: Order Confirmation
1. After payment, **Expected**: Redirect to order confirmation
2. Navigate to Orders page
3. **Expected**: Order appears with:
   - Order ID
   - Order details
   - Payment status
   - Delivery status

### Phase 4: Farmer Order Management

#### Step 11: View Orders as Farmer
1. Logout from buyer account
2. Login as farmer
3. Navigate to Farmer Portal → Orders
4. **Expected**: See the order from the buyer

#### Step 12: Update Order Status
1. Click on the order
2. Change status to "Confirmed"
3. **Expected**: Order status updated successfully

#### Step 13: Update Delivery Status
1. Once confirmed, add delivery details
2. Update delivery status to "Out for Delivery"
3. **Expected**: Delivery status updated

### Phase 5: Cleanup (Optional)

#### Step 14: Delete Test Data
1. As farmer, delete the animal listing
2. **Expected**: Animal removed from store
3. As admin (if available), delete test users
4. **Expected**: Database clean for next test

## Expected Behaviors Verification

### Authorization
- ✅ Farmers can only edit/delete their own animals
- ✅ Buyers cannot access farmer portal
- ✅ Farmers cannot access buyer-only features
- ✅ Unauthenticated users redirected to login

### Business Rules
- ✅ Cannot add unavailable animals to cart
- ✅ Cannot add same animal twice to cart
- ✅ Order total matches cart total
- ✅ Payment amount must match order total
- ✅ Animal status updates when sold

### Data Integrity
- ✅ All relationships properly maintained
- ✅ Cascading deletes work correctly
- ✅ Foreign key constraints enforced
- ✅ Unique constraints respected

## Troubleshooting

### Animal Not Showing in Store
- Check animal status is "AVAILABLE"
- Verify farmer profile is complete
- Check animal image was uploaded successfully

### Cart Issues
- Clear browser cache and retry
- Check cart API endpoint is responding
- Verify animal is still available

### Payment Issues
- Without M-Pesa credentials, use manual payment recording
- Check .env file has correct M-Pesa configuration
- Verify callback URL is accessible

### Database Issues
- Run `python clean_setup.py` to reset database
- Check database file permissions
- Verify migrations are up to date

## Success Criteria

The user journey is successful when:
1. ✅ Farmer can register and create profile
2. ✅ Farmer can add animal listings with images
3. ✅ Buyer can register and browse animals
4. ✅ Buyer can add animals to cart
5. ✅ Buyer can complete checkout
6. ✅ Payment is recorded (manual or M-Pesa)
7. ✅ Order is created and visible to both parties
8. ✅ Farmer can manage orders
9. ✅ All business rules are enforced
10. ✅ All authorization checks work correctly
