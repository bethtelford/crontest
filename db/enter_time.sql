insert into time_punch (label, time)
values ($1, $2)
returning *