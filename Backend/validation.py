import re

from marshmallow import Schema, fields, validate, ValidationError, validates


class SignUpSchema(Schema):
    first_name = fields.Str(required=True, validate=lambda x: len(x) <= 15)
    last_name = fields.Str(required=True, validate=lambda x: len(x) <= 15)
    email = fields.Email(required=True, validate=lambda x: len(x) <= 30)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 8)
    phone_number = fields.Str(required=True, validate=lambda x: len(x) <= 15)
    address = fields.Str(allow_none=True, validate=lambda x: len(x) <= 40 if x else True)


class AddSchema(Schema):
    product_name = fields.Str(required=True)
    category_id = fields.Int(required=True)
    description = fields.Str(required=True)
    price = fields.Float(required=True, validate=lambda x: 0 <= x <= 9999.99)
    stock = fields.Int(required=True, validate=lambda x: x >= 0)
    SKU = fields.Str(allow_none=True, validate=lambda x: len(x) <= 12 if x else True)

schema = SignUpSchema()
validate_item = AddSchema()
