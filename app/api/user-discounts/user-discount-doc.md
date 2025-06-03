# 取得 "指定會員" 專屬有效優惠券

GET
url: http://localhost:3000/api/user-discounts/[user_id]

# 新增優惠卷到 "指定會員" 身上

POST
url: http://localhost:3000/api/user-discounts/[user_id]/add

JSON BODY 範例:
{
"discount_id": 3,
"expires_at": "2025-12-31"
}

# 使用優惠券（更新為已使用）

PATCH
url: http://localhost:3000/api/user-discounts/[user_id]/use/[discount_id]
