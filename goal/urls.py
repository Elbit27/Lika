from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('', views.goal_list, name='goal_page'),
    path('create/', views.goal_create_page, name='goal_create'),
    path('api/', include(router.urls)),
]