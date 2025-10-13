from rest_framework import generics
from django.shortcuts import render, redirect
from django.views import generic
from . import serializers
from .models import Item

def schedule_view(request):
    items = Item.objects.all()
    return render(request, "core/schedule.html", {"items": items})


class ItemCreateView(generic.View):
    template_name = 'core/add_item.html'

    def get(self, request, *args, **kwargs):
        items = Item.objects.filter(user=request.user)
        return render(request, self.template_name, {'items': items})

    def post(self, request, *args, **kwargs):
        data = {
            'name': request.POST.get('name', '').strip(),
        }

        serializer = serializers.ItemCreateSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return redirect('schedule')  # имя URL, а не путь
        else:
            return render(request, self.template_name, {
                'items': Item.objects.filter(user=request.user),
                'form_errors': serializer.errors
            })

class ItemListView(generics.ListAPIView):
    queryset = Item.objects.all()
    serializer_class = serializers.ItemSerializer

