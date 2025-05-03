from django.shortcuts import render, redirect
from django.urls import path
from django.contrib.auth import login, authenticate
from .forms import SignUpForm, LoginForm


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