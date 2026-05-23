# Backend tests

Run commands from the `backend` directory.

## Unit tests

Run all non-integration tests:

```bash
uv run python -m unittest discover src/tests
```

Run one test module:

```bash
uv run python -m unittest src.tests.test_roadmap_service
```

## Integration tests

API integration tests are skipped by default. To run them, provide a test
MongoDB database name ending in `_test`:

```bash
$env:RUN_INTEGRATION_TESTS = "1"
$env:TEST_MONGODB_DATABASE = "roadmap_planner_test"
uv run python -m unittest discover src/tests
```

The integration tests clear their target collections, so do not point
`TEST_MONGODB_DATABASE` at a development or production database.

Run only the roadmap API integration tests:

```bash
$env:RUN_INTEGRATION_TESTS = "1"
$env:TEST_MONGODB_DATABASE = "roadmap_planner_test"
uv run python -m unittest src.tests.test_roadmap_service.RoadmapApiIntegrationTest
```
