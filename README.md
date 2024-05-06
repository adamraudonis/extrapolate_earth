# Extrapolate Earth

A website to share extrapolations about the future

### Setup

`npm i`

## Running Locally

`npm start` and open http://localhost:3000

### Schema

extrapolation_prompt:
id
extrapolation_text
user_id
unit
is_active
created_at

user_extrapolation:
id
extrapolation_prompt_id
user_id
created_at
rationale
is_active

extrapolation_values:
id
user_extrapolation:
extrapolation_prompt_id
year
value
user_id
created_at

ground_truth:
id
name
source_link
description
created_at
user_id

ground_truth_values:
ground_truth_id
year
value
created_at
user_id

### Precommit Setup

```
pip install pre-commit
pre-commit install
```
