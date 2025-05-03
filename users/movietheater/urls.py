from django.urls import path
from . import views
from .views import signup_view, login_view

urlpatterns = [
    path('', views.index, name='index'),
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
]