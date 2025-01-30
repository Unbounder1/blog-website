## CI/CD Process

Git clone -> build docker images -> push to local repository -> test on blog-dev namespace (development) -> push to real docker repository

## CURRENT METHOD:

`kubectl port-forward --address 0.0.0.0 service/docker-registry 5000:5000 -n docker-registry` on control plane node to forward local registry 

in /etc/hosts
```
#TEMP
<control-plane-ip> docker-registry.docker-registry.svc.cluster.local
```


## Allow HTTP for CRIO (do on all worker nodes)

On Ubuntu 24.04, create a new file `/etc/containers/registries.conf.d/insecure-registry.conf` with the following content:

```yaml
[[registry]]
prefix = "docker-registry.docker-registry.svc.cluster.local"
location = "docker-registry.docker-registry.svc.cluster.local"
insecure = true
```

Then restart `crio.service`:

`sudo systemctl restart crio.service`