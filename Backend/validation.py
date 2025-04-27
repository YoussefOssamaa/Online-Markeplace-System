import re

from marshmallow import Schema, fields, validate, ValidationError, validates


class SignUpSchema(Schema):
    first_name = fields.Str(required=True )
    last_name = fields.Str(required=True)
    email = fields.Email(required=True , validate=validate.Email())
    password = fields.Str(required=True, validate=validate.Length(min=6))
    address = fields.Str(required=False)
    phone_number = fields.Str(required=True , validate=validate.Length(max=16))

class AddSchema(Schema):
    category_id = fields.Integer(required=True)
    description = fields.Str(required=True)
    price = fields.Float(required=True)
    stock = fields.Integer()
    SKU = fields.Str()

schema = SignUpSchema()
validate_item = AddSchema()