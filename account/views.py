from dj_rest_auth.views import LogoutView
from rest_framework import permissions, generics
from . import serializers
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import User


# Now we need to create view, that registers the user
class UserRegisterView(generics.CreateAPIView):
    serializer_class = serializers.UserRegisterSerializer

# Это кастомизатор для модуля logout. Мы просто устанавливаем пермишенсы
class CustomLogoutView(LogoutView):
    permission_classes = (permissions.IsAuthenticated,)
#
# class UserProfileView(generics.RetrieveAPIView):
#     serializer_class = serializers.UserDetailSerializer
#     permission_classes = [permissions.IsAuthenticated,]
#
#     def get(self, request, *args, **kwargs):
#         user_pk = kwargs.get('pk')
#         if user_pk:
#             user = get_object_or_404(User, pk=user_pk)
#             detail_user = DetailUser.objects.filter(user=user).first()
#             tasks = Task.objects.filter(owner=user)  # исправлено
#
#             return render(request, 'core/profile/detail_user.html', {
#                 'detail_user': detail_user,
#                 'tasks': tasks,
#             })
#         else:
#             user = request.user
#
#             detail_user = DetailUser.objects.filter(user=user).first()
#             tasks = Task.objects.filter(owner=request.user)
#
#             return render(request, 'core/profile/profile.html', {
#                 'detail_user': detail_user,
#                 'tasks': tasks,
#             })

#
# def add_info(request):
#     if request.method == 'POST':
#         data = request.POST.copy()
#         data['user'] = request.user.id  # Указываем ID пользователя вручную
#
#         serializer = serializers.DetailUserSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save(user=request.user)
#             return redirect('frontpage')  # ⬅ должно быть именно redirect!
#
#         else:
#             return render(request, 'core/profile/add_info.html', {
#                 'errors': serializer.errors,
#                 'form_data': request.POST
#             })
#
#     if hasattr(request.user, 'detailuser'):
#         return redirect('frontpage')
#
#     return render(request, 'core/profile/add_info.html')