from django.urls import path
from .views import ItemListView, schedule_view, ItemCreateView

urlpatterns = [
    path('', schedule_view, name='schedule'),
    path('add_item/', ItemCreateView.as_view(), name='add-item'),
    path('items/', ItemListView.as_view(), name='item-listing'),
]