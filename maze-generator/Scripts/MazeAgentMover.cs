
using System.Collections.Generic;
using UnityEngine;

public class MazeAgentMover : MonoBehaviour
{
    public List<Vector3> path;
    public float moveSpeed = 3f;

    int index = 0;

    void Update()
    {
        if (path == null || path.Count == 0) return;
        if (index >= path.Count) return;

        Vector3 target = path[index] + new Vector3(0f, 0.5f, 0f);
        transform.position = Vector3.MoveTowards(transform.position, target, moveSpeed * Time.deltaTime);

        if (Vector3.Distance(transform.position, target) < 0.05f)
        {
            index++;
        }
    }
}
