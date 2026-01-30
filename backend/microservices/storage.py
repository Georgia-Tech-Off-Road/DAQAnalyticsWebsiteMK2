import os
import pandas as pd


class StorageBackend:
	""" Abstract class for storage """

	def read_json(self, path) -> pd.DataFrame:
		raise NotImplementedError

	def write_csv(self, path, df: pd.DataFrame):
		raise NotImplementedError


class LocalStorage(StorageBackend):
	""" Local development storage """

	def __init__(self, base_path="DAQFiles"):
		self.base_path = base_path

	def _full_path(self, path):
		return os.path.join(self.base_path, path)

	def read_json(self, path) -> pd.DataFrame:
		return pd.read_json(self._full_path(path))

	def write_csv(self, path, df: pd.DataFrame):
		full_path = self._full_path(path)
		os.makedirs(os.path.dirname(full_path), exist_ok=True)
		df.to_csv(full_path, index=False)


class S3Storage(StorageBackend):
	"""
	AWS Production storage.

	Requires s3fs package: pip install s3fs
	Pandas uses s3fs automatically for s3:// URLs.
	"""

	def __init__(self, bucket_name):
		self.bucket = bucket_name

	def _s3_path(self, path):
		return f"s3://{self.bucket}/{path}"

	def read_json(self, path) -> pd.DataFrame:
		return pd.read_json(self._s3_path(path))

	def write_csv(self, path, df: pd.DataFrame):
		df.to_csv(self._s3_path(path), index=False)


def get_storage() -> StorageBackend:
	"""
	Factory function - returns appropriate storage backend based on environment.

	Set STORAGE_TYPE=s3 and S3_BUCKET=your-bucket-name for AWS production.
	Defaults to local storage for development.
	"""
	storage_type = os.getenv("STORAGE_TYPE", "local")

	if storage_type == "s3":
		bucket = os.getenv("S3_BUCKET")
		if not bucket:
			raise ValueError("S3_BUCKET environment variable required when STORAGE_TYPE=s3")
		return S3Storage(bucket)
	else:
		base_path = os.getenv("LOCAL_STORAGE_PATH", "DAQFiles")
		return LocalStorage(base_path)
