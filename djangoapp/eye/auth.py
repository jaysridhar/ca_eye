import logging
from django.http import HttpResponse, HttpResponseNotAllowed, HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth.decorators import login_required
from rest_framework.authtoken.models import Token
from djangoapp.serializers import UserSerializer

L = logging.getLogger(__name__)

def login_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        print(f'Attempting to login({username}, {password})')
        next_url = request.POST['next'] if 'next' in request.POST else settings.LOGIN_REDIRECT_URL
        next_url = next_url or settings.LOGIN_REDIRECT_URL
        print(f'Does user exist with username={username}?')
        user = authenticate(request, username=username, password=password)
        if user:
            print(f'authenticated with username {UserSerializer(user).data}')
            login(request, user)
            return HttpResponseRedirect(next_url)
        else:
            print(f'Does user exist with email={username}?')
            qs = User.objects.filter(email__iexact=username)
            if qs.exists():
                if len(qs) == 1:
                    u = qs.get()
                    user = authenticate(request, username=u.username, password=password)
                    if user:
                        print(f'authenticated with email {UserSerializer(user).data}')
                        login(request, user)
                        return HttpResponseRedirect(next_url)
                else:
                    L.warning(f'multiple users found with email="{username}": {[x.username for x in qs]}')
            print(f'all auth attempts failed for username={username}')
            ctx = {'error': 'username not valid or password does not match',
                   'user': request.user}
            if 'next' in request.GET: ctx['next'] = request.GET['next']
            return render(request, 'base_home.html', ctx)
    else:
        return HttpResponseNotAllowed('HTTP method not allowed')

def logout_user(request):
    logout(request)
    return HttpResponseRedirect(settings.LOGOUT_REDIRECT_URL)

@login_required
def get_auth_token(request):
    return HttpResponse(str(Token.objects.get_or_create(user=request.user)[0]))
