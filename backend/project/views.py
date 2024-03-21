from django.shortcuts import render

# Create your views here.

def testView(request):
    return render(request, 'test.html')