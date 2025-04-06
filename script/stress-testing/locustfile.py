from locust import HttpUser, between, task


class WebsiteUser(HttpUser):
    wait_time = between(5, 15)
    
    @task
    def index(self):
        self.client.get("/")
        #self.client.get("/wallpaper.webp")
        
    #@task
    #def about(self):
        #self.client.get("/full-site/circuit-to-ltspice-project")