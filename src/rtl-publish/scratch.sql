select * from reports;

truncate table reports;

select * from sensors;

update sensors set data_validity = 0 where pid = 3;