const db = require("./db")

function getDatasetByID(id) {
	const stmt = db.prepare("SELECT * FROM Dataset WHERE id = ?");
	const dataset = stmt.get(id)
	return dataset
}

function deleteDatasetByID(id) {
	const stmt = db.prepare("DELETE FROM Dataset WHERE id = ?");
	stmt.run(id)
}

function fillDevelopmentDatabase() {
	const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
	const date = "2025-10-26 13:19:50"	
	const vehicles_stmt = db.prepare(`
		INSERT INTO Vehicle (id, title, description, uploaded_at, updated_at) VALUES 
		('1', 'OR-9', 'A beautiful vintage Off-Road vehicle, perfect for the clay at Iron Mountain','${now}','${now}'),
		('2', 'OR-X', 'Our newest Off-Road vehicle','${now}','${now}')
		`);
	const location_stmt = db.prepare(`
		INSERT INTO Location (id, title, description, competition, latitude, longitude, created_at, updated_at,  parent_id)
		VALUES
		('1', 'Iron Mountain', 'Iron Moutain testing track, located near Dahlonega', 0, 34.5473261,-84.1448203,'${now}','${now}', NULL)
		`);
	const dataset_stmt = db.prepare(`
		INSERT INTO Dataset (id, title, description, date, uploaded_at, updated_at, location_id, vehicle_id, competition)
		VALUES
		('1', '2025-10-26 13_19_50 (First Run)', 'RPM 4 (engine RPM) is useless. Rear RPM is very noisy. Rear brake pressure values seem plausible, front brake pressure useless.',
		'${date}','${now}','${now}','1', '1', 0)
		`);

	vehicles_stmt.run()
	location_stmt.run()
	dataset_stmt.run()
}

module.exports = {getDatasetByID, deleteDatasetByID, fillDevelopmentDatabase};
