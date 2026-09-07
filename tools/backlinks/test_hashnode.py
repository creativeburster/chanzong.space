# -*- coding: utf-8 -*-
import json
import urllib.request

TOKEN = "41b853b7-84ae-4b98-a293-7723ef9c6b1c"

def test_hashnode():
    query = """
    query {
      me {
        id
        username
        name
        publications(first: 10) {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
    """
    req = urllib.request.Request(
        "https://gql.hashnode.com",
        data=json.dumps({"query": query}).encode("utf-8"),
        headers={
            "Authorization": TOKEN,
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print("Hashnode response:", json.dumps(data, indent=2))
            return data
    except Exception as e:
        print("Error:", e)
        if hasattr(e, 'read'):
            print("Detail:", e.read().decode('utf-8'))

if __name__ == "__main__":
    test_hashnode()
