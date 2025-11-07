
# Overview
.json data files will be stored locally. All data files will be stored in the backend under the ``/data`` folder. Whenever a new file is uploaded, we create a new folder for it in ``/data``, e.x ``/data/file_name/``. In ``/data/file_name`` will be all files associated with that data file, for example:
 - raw_data_file (unmodified from test)
 - processed_data_file (modified from test)
 - data_file_resolution_1
 - data_file_resolution_2
 - data_file_resolution_n

Metadata (title, location, etc.) on the datasets will be stored in an sqlite server.

All of these names above are suggestions for the file use and should not necessarily be taken as the file name for the files.

# Data File Structure

``/data``
- ``/file_name_one``
  - ``raw_data_file``
  - ``processed_data_file``
  - ``data_file_resolution_1``
  - ``data_file_resolution_2``
- ``/file_name_two``
  - ``raw_data_file``
  - ``processed_data_file``
  - ``data_file_resolution_1``
  - ``data_file_resolution_2``