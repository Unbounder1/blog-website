Steps to deploying and maintaining PostgreSQL high availability
Once the method of replication is determined and the architecture is designed, it’s time to deploy it. As with the architecture itself, deployment can be easier and more cost-effective when enlisting high availability support for PostgreSQL from outside experts. It depends on what expertise you have on staff. 

Every database environment is different, so deployment procedures can vary, but here are some general steps:

Configure the primary server. This server, the primary read-write node, will orchestrate data replication to standby servers.
Create a primary server backup on the standby server or servers. 
Configure the standby server to run in hot standby mode. The hot standby allows the standby server to be used for reads. It prevents complications and losses in the event of a failure or scheduled maintenance of the primary server.
Configure load balancing. Using pgpool-II, HAProxy, or other PostgreSQL load balancing tools, your database will be ready for high traffic and to distribute read queries across multiple servers.
Implement backup and disaster recovery. Since HA alone does not guarantee data protection, you should implement mechanisms for data durability and disaster recovery.
 Regularly schedule backups and test the restore process to ensure data integrity.
Test the setup. Here are a couple options. Ideally, both could be used. 
End-to-end (E2E) testing, though time-consuming, will show whether all components and applications of your HA setup work as intended.
Chaos engineering is another option. This is when engineers introduce problems throughout the database infrastructure, so they can identify failure points and create solutions — avoiding costly downtime and potential loss of frustrated customers.