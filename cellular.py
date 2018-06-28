
import json
import sys

o = {"ssid" : "", "pass" : "", "next" : 30};
sys.stdout.write(json.dumps(o))
sys.stdout.flush()
