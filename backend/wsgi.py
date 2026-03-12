import sys
import os

# Add your project directory to the sys.path
path = '/home/YOUR_USERNAME/Homeworkrecordingsystem/backend'
if path not in sys.path:
    sys.path.append(path)

from run import app as application
