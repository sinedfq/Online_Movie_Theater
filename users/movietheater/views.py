from django.shortcuts import render, redirect
from django.urls import path
from django.contrib.auth import login, authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from .forms import SignUpForm, LoginForm
from .models import Movie
from .serializer import MovieSerializer


def index(request):
    context = {
        'products': ['Товар 1', 'Товар 2', 'Товар 3'],
    }
    return render(request, 'movietheater/index.html', context)

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()          
            login(request, user)       
            return redirect('home')     
    else:
        form = SignUpForm()
    return render(request, 'registration/signup.html', {'form': form})

def login_view(request):
    form = LoginForm(data=request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(username=username, password=password) 
            if user is not None:
                login(request, user)    
                return redirect('index')  
    return render(request, 'registration/login.html', {'form': form})

class MovieView(APIView):
    def get(self, request):
        output = [
            {
                "title": output.title,
                "description": output.description,
                "video_url": output.video_url,
            } for output in Movie.objects.all()
        ]
        return Response(output)
    
    def post(self, request):
        serializer = MovieSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)