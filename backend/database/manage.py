import argparse
import sqlite3
import sys
from os import listdir, remove
from os.path import isfile, join
import glob
from pathlib import Path

cmd_help_msg = """Command that you would like to run:  

    migrate: run migrations on [database]
    refresh: delete [datbase] then start from scratch with [migrations]"""
database_help_msg = """Path to your .db sqlite3 file"""
migrations_path_help_msg = """Path to a folder containing your .sql migration files"""


def parse_command(command, migrations_path, database_path):
    if command == "migrate":
        cursor = init_database_connection(database_path)
        migrate(cursor,migrations_path)
    elif command == "refresh":
        remove(database_path)
        cursor = init_database_connection(database_path)
        migrate(cursor,migrations_path)
    else:
        raise Exception("Unknown command")
def init_database_connection(database_path):
    conn = sqlite3.connect(database_path)
    cur = conn.cursor()
    if not cur:
        raise Exception(f"Database path {database_path} is invalid", file=sys.stderr)
    return cur

def migrate(cursor, migrations_path):
    print(f"Migrating {database_path}")
    root_dir = Path(migrations_path)
    if not root_dir.is_dir():
        raise Exception(f"{root_dir} is not a valid directory!", file=sys.stderr)
    files = root_dir.glob("*.sql", recurse_symlinks=False)
    files = sorted(files)
    if verbose:
        print("About to run the following migrations:")
        for file in files:
            print(file)
        confirmed = input("Confirm(Y/n)?")
        if not confirmed in ["y", "Y", "yes", "Yes"]:
            print("Terminating from script")
            sys.exit()

    for f in files:
        print(f"Executing migration {f.name}:")
        commands = f.read_text()
        if verbose:
            print(f"Executing:{commands}\n")
        cursor.executescript(commands)
    print("Sucessfully migrated")


parser = argparse.ArgumentParser()
parser.add_argument("command", help=cmd_help_msg, type=str)
parser.add_argument("migrations", help=migrations_path_help_msg, type=str)
parser.add_argument("database", help=database_help_msg, type=str)
parser.add_argument("-v", "--verbose", action='store_true')
args = parser.parse_args()

verbose = args.verbose
database_path = args.database
parse_command(args.command, args.migrations, database_path)
