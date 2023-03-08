# MongoDb Stats Exporter

A small fastify server that exports database statistics as prometheus metrics from one or more mongodb databases.

## Usage

To run the service, you have to place the following environment variables in a `.env` file:

* `MONGODB_URL`: mongodb connection string;
* `MONGODB_NAMES`: comma separated list of database names

The file can be simply named `.env` and placed in the same directory of the service, or in another location by setting an environment variable `ENV_FILE`.

Then, just launch `npm start`

## Call the service

The service listens on port `3000` and expose a `/-/metrics` GET endpoint. The service will respond with default prometheus metrics, along with the numeric values from the mongodb client stats method representend as gauge metrics.

```
# HELP collections metric measuring collections value from database stats.
# TYPE collections gauge
collections{database="test"} 0

# HELP views metric measuring views value from database stats.
# TYPE views gauge
views{database="test"} 0

# HELP objects metric measuring objects value from database stats.
# TYPE objects gauge
objects{database="test"} 0

# HELP avgObjSize metric measuring avgObjSize value from database stats.
# TYPE avgObjSize gauge
avgObjSize{database="test"} 0

# HELP dataSize metric measuring dataSize value from database stats.
# TYPE dataSize gauge
dataSize{database="test"} 0

# HELP storageSize metric measuring storageSize value from database stats.
# TYPE storageSize gauge
storageSize{database="test"} 0

# HELP totalSize metric measuring totalSize value from database stats.
# TYPE totalSize gauge
totalSize{database="test"} 0

# HELP indexes metric measuring indexes value from database stats.
# TYPE indexes gauge
indexes{database="test"} 0

# HELP indexSize metric measuring indexSize value from database stats.
# TYPE indexSize gauge
indexSize{database="test"} 0

# HELP scaleFactor metric measuring scaleFactor value from database stats.
# TYPE scaleFactor gauge
scaleFactor{database="test"} 1

# HELP fileSize metric measuring fileSize value from database stats.
# TYPE fileSize gauge
fileSize{database="test"} 0

# HELP fsUsedSize metric measuring fsUsedSize value from database stats.
# TYPE fsUsedSize gauge
fsUsedSize{database="test"} 0

# HELP fsTotalSize metric measuring fsTotalSize value from database stats.
# TYPE fsTotalSize gauge
fsTotalSize{database="test"} 0

# HELP ok metric measuring ok value from database stats.
# TYPE ok gauge
ok{database="test"} 1
```