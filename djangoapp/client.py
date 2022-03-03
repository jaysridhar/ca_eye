#!/usr/bin/python

import argparse, uuid, requests, datetime, json

parser = argparse.ArgumentParser(description="TheEye client")
parser.add_argument('-authtoken',
                    default='6120114ff9d229f1b9a27c0f11df78e2f13d3723',
                    help='Use this token for authentication')
parser.add_argument('-server',
                    default='http://localhost:8000',
                    help='TheEye Server location ("scheme://hostname:port")')

actions_sp = parser.add_subparsers(title='Actions', dest='action')

ses_parser = actions_sp.add_parser('session', description='Create a new session ID')

reg_parser = actions_sp.add_parser('register', description='Register a new event')
reg_parser.add_argument('session', help='Use this session ID')
reg_parser.add_argument('category', help='Category of the event')
reg_parser.add_argument('name', help='Name of the event')
reg_parser.add_argument('payload', help='Event payload in JSON format. Prefix value with "@" to read from file.')

args = parser.parse_args()
print(args)

if not args.action:
    raise ValueError('action is required')
elif args.action == 'session':
    print(f'Session ID: {str(uuid.uuid1())}')
elif args.action == 'register':
    payload = args.payload
    timestamp = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')
    if payload.startswith('@'):
        with open(payload[1:]) as fp: payload = fp.read()
    obj = json.loads(payload)
    res = requests.post(f'{args.server}/event', headers={'Authorization': f'Token {args.authtoken}'}, json={
        'session_id': args.session, 'category': args.category, 'name': args.name,
        'data': obj, 'timestamp': timestamp
    })
    res.raise_for_status()
    print(res.text)
else:
    raise ValueError(f'unknown action {args.action}')
