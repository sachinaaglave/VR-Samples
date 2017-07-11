import uuid
import os

filepath = '/home/sachin/Downloads/drive-download-20170513T155150Z-001'
os.chdir(filepath)
for num, filename in enumerate(os.listdir(os.getcwd()), start= 1):
    fname, ext = filename, ''
    print filename
    cmd = 'mv ' + filename + " " + str(uuid.uuid4()) + '.png'
    os.system(cmd)