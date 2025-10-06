from marshmallow import Schema, fields, ValidationError, validate
import re

class AskQuestionSchema(Schema):
    question = fields.Str(required=True, validate=[
        validate.Length(min=1, max=1000, error="Question must be between 1 and 1000 characters"),
        validate.Regexp(r'^[a-zA-Z0-9\s\?\.\,\!\-\'\"]+$', error="Question contains invalid characters")
    ])
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi'], error="Invalid language code"))
    case_number = fields.Str(allow_none=True, validate=validate.Length(max=50))
    history = fields.Str(allow_none=True, validate=validate.Length(max=5000))

class SubmitSessionSchema(Schema):
    email = fields.Email(required=True)
    case_number = fields.Str(allow_none=True, validate=validate.Length(max=50))
    summary = fields.Str(required=True, validate=validate.Length(min=10, max=5000))
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi']))
    documents = fields.List(fields.Str(validate=validate.Length(max=100)), allow_none=True)

class GenerateQueueSchema(Schema):
    case_type = fields.Str(required=True, validate=[
        validate.Length(min=1, max=20),
        validate.Regexp(r'^[A-Za-z0-9\-_]+$', error="Case type contains invalid characters")
    ])
    priority = fields.Str(required=True, validate=validate.OneOf(['A', 'B', 'C', 'D']))
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi']))
    user_name = fields.Str(allow_none=True, validate=validate.Length(max=255))
    user_email = fields.Email(allow_none=True)
    phone_number = fields.Str(allow_none=True, validate=validate.Length(max=50))

class DVRORAGSchema(Schema):
    question = fields.Str(required=True, validate=validate.Length(min=1, max=1000))
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi']))

class CallNextSchema(Schema):
    # No required fields for calling next
    pass

class CompleteCaseSchema(Schema):
    queue_number = fields.Str(required=True, validate=[
        validate.Length(min=1, max=20),
        validate.Regexp(r'^[A-Za-z0-9\-_]+$', error="Queue number contains invalid characters")
    ])

class GuidedQuestionsSchema(Schema):
    case_type = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi']))

class ProcessAnswersSchema(Schema):
    queue_number = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    answers = fields.Dict(required=True)
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi']))

class SendEmailSchema(Schema):
    email = fields.Email(required=True)
    case_data = fields.Dict(required=True)

class GenerateCaseSummarySchema(Schema):
    flow_type = fields.Str(required=True, validate=validate.OneOf(['DVRO', 'Civil', 'Elder', 'Workplace']))
    answers = fields.Dict(required=True)
    flow_data = fields.Dict(required=True)
    email = fields.Email(required=True)
    user_name = fields.Str(allow_none=True, validate=validate.Length(max=255))
    language = fields.Str(validate=validate.OneOf(['en', 'es', 'zh', 'vi']))
    join_queue = fields.Bool(allow_none=True)

def validate_request_data(schema_class, data):
    """Validate request data using the specified schema"""
    try:
        schema = schema_class()
        validated_data = schema.load(data)
        return validated_data, None
    except ValidationError as e:
        return None, e.messages
