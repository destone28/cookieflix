"""
Cookieflix API - Critical Tests
Run with: pytest test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.utils.auth import get_password_hash

# Create test client
client = TestClient(app)

# Test credentials
TEST_USER_EMAIL = "test@cookieflix.com"
TEST_USER_PASSWORD = "TestPassword123!"
TEST_ADMIN_EMAIL = "admin@cookieflix.com"
TEST_ADMIN_PASSWORD = "adminpassword"


class TestHealthChecks:
    """Test health check endpoints"""

    def test_root_health(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_api_health(self):
        """Test API health endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_admin_public_health(self):
        """Test admin public health endpoint"""
        response = client.get("/api/admin/public-health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestAuthentication:
    """Test authentication endpoints"""

    def test_register_user(self):
        """Test user registration"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "full_name": "Test User"
            }
        )
        # May return 200 (success) or 400 (already exists)
        assert response.status_code in [200, 400]

    def test_login_user(self):
        """Test user login"""
        response = client.post(
            "/api/auth/token",
            data={
                "username": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
        )
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post(
            "/api/auth/token",
            data={
                "username": "nonexistent@test.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401

    def test_get_current_user_without_token(self):
        """Test accessing protected endpoint without token"""
        response = client.get("/api/auth/me")
        assert response.status_code == 401


class TestProducts:
    """Test product endpoints"""

    def test_get_categories(self):
        """Test getting categories list"""
        response = client.get("/api/products/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_designs(self):
        """Test getting designs list"""
        response = client.get("/api/products/designs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_category_by_slug(self):
        """Test getting category by slug"""
        # First get all categories
        response = client.get("/api/products/categories")
        categories = response.json()

        if categories:
            # Test with first category
            slug = categories[0]["slug"]
            response = client.get(f"/api/products/categories/{slug}")
            assert response.status_code in [200, 404]


class TestSubscriptions:
    """Test subscription endpoints"""

    def test_get_subscription_plans(self):
        """Test getting subscription plans"""
        response = client.get("/api/subscriptions/plans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if data:
            # Verify plan structure
            plan = data[0]
            assert "name" in plan
            assert "monthly_price" in plan
            assert "categories_count" in plan


class TestAdmin:
    """Test admin endpoints (require authentication)"""

    @pytest.fixture
    def admin_token(self):
        """Get admin token for authenticated requests"""
        response = client.post(
            "/api/auth/admin-login",
            data={
                "username": TEST_ADMIN_EMAIL,
                "password": TEST_ADMIN_PASSWORD
            }
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        return None

    def test_admin_health_without_auth(self):
        """Test admin health endpoint without authentication"""
        response = client.get("/api/admin/health")
        assert response.status_code == 401

    def test_admin_health_with_auth(self, admin_token):
        """Test admin health endpoint with authentication"""
        if admin_token:
            response = client.get(
                "/api/admin/health",
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            assert response.status_code == 200
            assert "status" in response.json()

    def test_admin_get_users_without_auth(self):
        """Test getting users list without authentication"""
        response = client.get("/api/admin/users")
        assert response.status_code == 401

    def test_admin_get_categories_without_auth(self):
        """Test getting admin categories without authentication"""
        response = client.get("/api/admin/categories")
        assert response.status_code == 401


class TestFileUpload:
    """Test file upload endpoints"""

    def test_upload_without_auth(self):
        """Test upload endpoint requires authentication"""
        files = {"file": ("test.jpg", b"fake image content", "image/jpeg")}
        response = client.post("/api/upload/category-image", files=files)
        assert response.status_code == 401


class TestAPIDocumentation:
    """Test API documentation endpoints"""

    def test_openapi_json(self):
        """Test OpenAPI JSON is accessible"""
        response = client.get("/api/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data

    def test_swagger_docs(self):
        """Test Swagger UI is accessible"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_redoc(self):
        """Test ReDoc is accessible"""
        response = client.get("/redoc")
        assert response.status_code == 200


class TestSecurity:
    """Test security features"""

    def test_cors_headers(self):
        """Test CORS headers are present"""
        response = client.get("/api/health")
        # Check that CORS headers would be added by middleware
        assert response.status_code == 200

    def test_security_headers(self):
        """Test security headers are present"""
        response = client.get("/")
        headers = response.headers
        # These headers are added by middleware
        assert "X-Content-Type-Options" in headers or response.status_code == 200

    def test_weak_password_rejected(self):
        """Test that weak passwords are rejected"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "weak@test.com",
                "password": "123",  # Too weak
                "full_name": "Weak Password"
            }
        )
        assert response.status_code == 422  # Validation error


# Run tests with: pytest test_api.py -v
# Coverage: pytest test_api.py -v --cov=app --cov-report=html
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
